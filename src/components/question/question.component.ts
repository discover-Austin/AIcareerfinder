import { Component, ChangeDetectionStrategy, input, output, signal, effect, untracked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question, AnswerOption, UserAnswer } from '../../models/personality-test.model';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  question = input.required<Question>();
  answered = output<UserAnswer>();

  selectedOption = signal<AnswerOption | null>(null);
  sliderValue = signal<number>(50);
  textInputValue = signal<string>('');
  private textInputDebounceTimer: any;

  constructor() {
    effect(() => {
      // Reset local state when the input question changes
      const currentQuestion = this.question();
      untracked(() => {
        this.selectedOption.set(null);
        this.sliderValue.set(50);
        this.textInputValue.set('');
      });
    });
  }

  onOptionSelect(option: AnswerOption): void {
    this.selectedOption.set(option);
    this.answered.emit({
      questionId: this.question().id,
      value: option.text
    });
  }

  onSliderChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.sliderValue.set(value);
  }
  
  onSliderRelease(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.answered.emit({
      questionId: this.question().id,
      value: value
    });
  }
  
  onTextInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.textInputValue.set(value);

    clearTimeout(this.textInputDebounceTimer);
    this.textInputDebounceTimer = setTimeout(() => {
      this.answered.emit({
        questionId: this.question().id,
        value: value
      });
    }, 250); // Debounce to avoid excessive emissions
  }
}
