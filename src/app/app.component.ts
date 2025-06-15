import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RuletaComponent } from './ruleta/ruleta.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RuletaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ruleta';
}
