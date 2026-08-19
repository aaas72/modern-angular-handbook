import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
})
export class Card {
  // Signal-based inputs
  title = input<string>('Default Title');
  description = input<string>('Default card description explaining the topic.');
  tag = input<string>('Topic');

  // Signal-based output event
  actionClick = output<string>();

  onButtonClick() {
    this.actionClick.emit(this.title());
  }
}
