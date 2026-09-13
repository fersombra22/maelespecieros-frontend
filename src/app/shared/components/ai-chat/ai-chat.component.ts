import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  time: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  isOpen = false;
  hasAccess = false;
  message = '';
  loading = false;
  
  messages: ChatMessage[] = [
    { text: '¡Hola! Soy Mael IA. ¿En qué te puedo ayudar hoy con el negocio?', isUser: false, time: new Date() }
  ];

  ngOnInit() {
    const user = this.authService.obtenerUsuario();
    const role = user?.rol;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      this.hasAccess = true;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.message.trim() || this.loading) return;
    
    const userMsg = this.message;
    this.messages.push({ text: userMsg, isUser: true, time: new Date() });
    this.message = '';
    this.loading = true;
    
    setTimeout(() => this.scrollToBottom(), 100);

    this.dashboardService.askChat(userMsg).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.messages.push({ text: res.data.reply, isUser: false, time: new Date() });
        } else {
          this.messages.push({ text: 'Error al obtener respuesta.', isUser: false, time: new Date() });
        }
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.loading = false;
        this.messages.push({ text: 'Error de conexión con IA.', isUser: false, time: new Date() });
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  private scrollToBottom() {
    const body = document.querySelector('.chat-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }
}
