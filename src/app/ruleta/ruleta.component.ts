import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.css'],
})
export class RuletaComponent implements AfterViewInit {
  @ViewChild('wheelCanvas') wheelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tickSound') tickSound!: ElementRef<HTMLAudioElement>;

  options: string[] = [];
  optionsText: string = `1\n2\n3\n4`; // valores iniciales
  ruletaName: string = 'Ruleta #1';
  colors: string[] = [];
  savedRuletas: { name: string; options: string[] }[] = [];

  ctx!: CanvasRenderingContext2D;
  spinning = false;
  selectedOption: string | null = null;
  rotation = 0;
  lastTick = 0;

  ngAfterViewInit() {
    this.ctx = this.wheelCanvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.loadRuletasFromStorage(); // <--- carga
    this.updateOptionsFromText();
  }

  resizeCanvas() {
    const canvas = this.wheelCanvas.nativeElement;
    const parent = canvas.parentElement!;
    const size = Math.min(parent.clientWidth, window.innerHeight * 0.75);
    canvas.width = size;
    canvas.height = size;
    this.drawWheel();
  }

  updateOptionsFromText() {
    const rawOptions = this.optionsText
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o !== '');
    this.options = rawOptions;
    this.generateColors();
    this.drawWheel();
  }

  generateColors() {
    this.colors = this.options.map(
      (_, i) => `hsl(${(i * 360) / this.options.length}, 70%, 60%)`
    );
  }

  drawWheel() {
    const canvas = this.wheelCanvas.nativeElement;
    const ctx = this.ctx;
    const size = canvas.width;
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;
    const anglePerSegment = (2 * Math.PI) / this.options.length;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < this.options.length; i++) {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = this.colors[i];
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.floor(size / 25)}px Arial`;
      ctx.textAlign = 'right';
      ctx.fillText(this.options[i], radius - 10, 10);
      ctx.restore();
    }
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.selectedOption = null;

    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = 360 * 5 + extraDegrees;

    const start = performance.now();
    const duration = 6000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.rotation = totalRotation * ease;

      const currentTick = Math.floor(
        this.rotation / (360 / this.options.length)
      );
      if (currentTick !== this.lastTick) {
        this.lastTick = currentTick;
        this.tickSound.nativeElement.play().catch(console.error);
      }

      const canvas = this.wheelCanvas.nativeElement;
      const size = canvas.width;
      const half = size / 2;

      this.ctx.save();
      this.ctx.clearRect(0, 0, size, size);
      this.ctx.translate(half, half);
      this.ctx.rotate((this.rotation * Math.PI) / 180);
      this.ctx.translate(-half, -half);
      this.drawWheel();
      this.ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.spinning = false;
        this.getResult(this.rotation);
      }
    };

    requestAnimationFrame(animate);
  }

  getResult(rotation: number) {
    const degrees = (rotation + 360 / this.options.length / 2) % 360;
    const segmentAngle = 360 / this.options.length;
    const index = Math.floor(
      ((360 - degrees + segmentAngle / 2) % 360) / segmentAngle
    );
    this.selectedOption = this.options[index];
  }

  saveCurrentRuleta() {
    if (!this.ruletaName.trim() || this.options.length === 0) return;

    const exists = this.savedRuletas.find((r) => r.name === this.ruletaName);
    if (exists) {
      exists.options = [...this.options];
    } else {
      this.savedRuletas.push({
        name: this.ruletaName.trim(),
        options: [...this.options],
      });
    }

    this.persistRuletas(); // <--- guarda en localStorage
  }

  loadRuleta(ruleta: { name: string; options: string[] }) {
    this.ruletaName = ruleta.name;
    this.optionsText = ruleta.options.join('\n');
    this.updateOptionsFromText();
  }

  persistRuletas() {
    localStorage.setItem('ruletas', JSON.stringify(this.savedRuletas));
  }

  loadRuletasFromStorage() {
    const data = localStorage.getItem('ruletas');
    if (data) {
      this.savedRuletas = JSON.parse(data);
    }
  }
}
