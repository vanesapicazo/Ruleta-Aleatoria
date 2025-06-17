import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RuletaComponent } from './ruleta/ruleta.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RuletaComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ruleta';
  winner: string | null = null;
}
