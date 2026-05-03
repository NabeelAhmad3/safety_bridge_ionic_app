import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/services/auth';
import { FirestoreService } from '../../services/services/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  profile: any = null;
  currentUser: any = null;
  isLoading = true;

  // Conversation list view
  activeTab = 'conversations';
  conversations: any[] = [];
  specialists: any[] = [];
  filteredSpecialists: any[] = [];
  specialistSearch = '';
  activeChatId: string | null = null;
  activeChatPartner: any = null;
  messages: any[] = [];
  newMessage = '';
  isSending = false;
  showEmojiPicker = false;

  private messagesSub: Subscription | null = null;
  private chatsSub: Subscription | null = null;

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private fs: FirestoreService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.currentUser = user;
        this.profile = await this.authService.getUserProfile(user.uid);
        this.loadConversations();

        if (this.isPatient) {
          this.loadSpecialists();
        }

        const chatId = this.route.snapshot.paramMap.get('chatId');
        if (chatId) {
          this.openChatById(chatId);
        }

        this.isLoading = false;
      }
    });
  }

  get isPatient(): boolean {
    return this.profile?.role === 'patient';
  }

  get isSpecialist(): boolean {
    return ['doctor', 'physiotherapist', 'nurse'].includes(this.profile?.role);
  }

  loadConversations() {
    this.chatsSub = this.fs.getUserChats(this.currentUser.uid).subscribe(chats => {
      this.conversations = chats.sort((a, b) => {
        const dA = a.lastMessageTime?.toDate?.() || new Date(0);
        const dB = b.lastMessageTime?.toDate?.() || new Date(0);
        return dB.getTime() - dA.getTime();
      });
    });
  }

  getPartnerName(chat: any): string {
    const names = chat.participantNames || {};
    return Object.entries(names)
      .filter(([uid]) => uid !== this.currentUser.uid)
      .map(([, name]) => name as string)[0] || 'Unknown';
  }

  getPartnerRole(chat: any): string {
    const roles = chat.participantRoles || {};
    return Object.entries(roles)
      .filter(([uid]) => uid !== this.currentUser.uid)
      .map(([, role]) => role as string)[0] || '';
  }

  getPartnerId(chat: any): string {
    const participants: string[] = chat.participants || [];
    return participants.find(uid => uid !== this.currentUser.uid) || '';
  }

  loadSpecialists() {
    const all: any[] = [];
    this.fs.getDoctors().subscribe(doctors => {
      doctors.forEach(d => all.push({ ...d, roleLabel: 'Doctor' }));
      this.fs.getPhysiotherapists().subscribe(physios => {
        physios.forEach(p => all.push({ ...p, uid: p.uid || p.id, roleLabel: 'Physiotherapist' }));
        this.fs.getNurses().subscribe(nurses => {
          nurses.forEach(n => all.push({ ...n, uid: n.uid || n.id, roleLabel: 'Nurse' }));
          this.specialists = all;
          this.filteredSpecialists = all;
        });
      });
    });
  }

  onSpecialistSearch() {
    const q = this.specialistSearch.trim().toLowerCase();
    if (!q) {
      this.filteredSpecialists = this.specialists;
      return;
    }
    this.filteredSpecialists = this.specialists.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.roleLabel?.toLowerCase().includes(q) ||
      s.specialization?.toLowerCase().includes(q)
    );
  }

  async startChat(specialist: any) {
    const chatId = await this.fs.createOrGetChat(
      { uid: this.currentUser.uid, name: this.profile?.name, role: this.profile?.role },
      specialist
    );
    this.openChat(chatId, specialist);
    this.activeTab = 'conversations';
  }

  openChatById(chatId: string) {
    const chat = this.conversations.find(c => c.id === chatId);
    if (chat) {
      const partnerId = this.getPartnerId(chat);
      const partnerName = this.getPartnerName(chat);
      const partnerRole = this.getPartnerRole(chat);
      this.openChat(chatId, { uid: partnerId, name: partnerName, role: partnerRole });
    }
  }

  openChat(chatId: string, partner: any) {
    this.messagesSub?.unsubscribe();

    this.activeChatId = chatId;
    this.activeChatPartner = partner;
    this.messages = [];

    this.messagesSub = this.fs.getMessages(chatId).subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  closeChat() {
    this.messagesSub?.unsubscribe();
    this.activeChatId = null;
    this.activeChatPartner = null;
    this.messages = [];
    this.newMessage = '';
  }

  async sendMessage() {
    const text = this.newMessage.trim();
    if (!text || !this.activeChatId || this.isSending) return;

    this.isSending = true;
    this.newMessage = '';

    const message = {
      text,
      senderId: this.currentUser.uid,
      senderName: this.profile?.name || 'Unknown',
      senderRole: this.profile?.role || '',
    };

    await this.fs.sendMessage(this.activeChatId, message);
    await this.fs.updateLastMessage(this.activeChatId, text);

    this.isSending = false;
    this.scrollToBottom();
  }

  onEnterKey(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  isMyMessage(msg: any): boolean {
    return msg.senderId === this.currentUser?.uid;
  }

  formatTime(date: any): string {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  }

  formatLastMessageTime(date: any): string {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'doctor': return 'tertiary';
      case 'physiotherapist': return 'secondary';
      case 'nurse': return 'success';
      case 'patient': return 'primary';
      default: return 'medium';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'doctor': return 'medkit';
      case 'physiotherapist': return 'fitness';
      case 'nurse': return 'heart-circle';
      default: return 'person-circle';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'physiotherapist': return 'Physiotherapist';
      case 'nurse': return 'Nurse';
      case 'patient': return 'Patient';
      default: return role;
    }
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
    this.chatsSub?.unsubscribe();
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }
  emojis = [
    '😊', '😂', '❤️', '👍', '😍', '🙏', '😭', '😘', '👏', '🔥',
    '😁', '🥰', '😎', '😢', '😅', '🤔', '😏', '😒', '😴', '🤗',
    '👋', '✅', '🎉', '💪', '🙌', '😡', '😱', '🤣', '💯', '❓',
    '🌟', '💔', '🎊', '🤝', '👀', '💀', '🫶', '🥹', '😤', '🫠',

    '🏥', '💊', '💉', '🩺', '🩻', '🧬', '🩹', '🩼', '🦷', '👁️',
    '🫀', '🫁', '🧠', '🦴', '🦾', '🩸', '🧪', '🔬', '🧫', '🧯',
    '😷', '🤒', '🤕', '🤢', '🤧', '🥵', '🥶', '😵', '🤯', '😪',
    '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '🧑‍⚕️', '💆', '🏃', '🧘', '🥗', '💧',

    '🚑', '🚒', '🏨', '⚕️', '☤', '🔴', '🟢', '⚠️', '🆘', '❤️‍🩹',
    '🛏️', '🪑', '🚿', '🛁', '🪥', '🧴', '🧼', '🪒', '🌡️', '⏱️',
    '📋', '📊', '📈', '📉', '🗒️', '📁', '📂', '🗂️', '📌', '✏️',
    '💼', '🧳', '🪜', '🔑', '🔒', '📞', '☎️', '📟', '🖥️', '💻',

    '🥦', '🥕', '🍎', '🍊', '🍋', '🫐', '🍇', '🥝', '🥑', '🫚',
    '🏋️', '🤸', '⛹️', '🚴', '🧗', '🤾', '🏊', '🚶', '🧎', '🪷',
    '😌', '🥺', '😔', '😞', '😓', '😩', '😫', '🥱', '😶', '🫥',
    '💬', '💭', '🗨️', '📢', '📣', '🔔', '⭐', '🌙', '☀️', '🌤️',
  ];

}
