import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-paywall-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './paywall-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaywallModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Upgrade to Premium');
  message = input<string>('This feature is available for Premium and Professional subscribers.');
  features = input<string[]>([
    'Unlimited personality tests',
    'Detailed career analysis',
    'Career comparison tool',
    'Learning paths',
    'Interview preparation',
    'PDF export',
  ]);

  close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
