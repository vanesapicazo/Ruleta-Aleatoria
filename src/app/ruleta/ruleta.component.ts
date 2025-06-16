import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.css'],
})
export class RuletaComponent implements AfterViewInit {
  @ViewChild('wheelCanvas') wheelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tickSound') tickSound!: ElementRef<HTMLAudioElement>;

  options: string[] = [
    'Premio 1',
    'Premio 2',
    'Premio 3',
    'Premio 4',
    'Premio 5',
    'Premio 6',
    'Premio 7',
    'Premio 8',
  ];
  colors: string[] = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F333FF',
    '#FF33AA',
    '#FFD133',
    '#33FFF6',
    '#FF9A33',
  ];

  ctx!: CanvasRenderingContext2D;
  spinning = false;
  selectedOption: string | null = null;
  rotation = 0;
  lastTick = 0;

  ngAfterViewInit() {
    const canvas = this.wheelCanvas.nativeElement;
    canvas.width = 400;
    canvas.height = 400;
    this.ctx = canvas.getContext('2d')!;
    this.drawWheel();
  }

  drawWheel() {
    const ctx = this.ctx;
    const radius = 200;
    const centerX = 200;
    const centerY = 200;
    const anglePerSegment = (2 * Math.PI) / this.options.length;

    ctx.clearRect(0, 0, 400, 400);

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
      ctx.font = 'bold 16px Arial';
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
        this.tickSound.nativeElement
          .play()
          .catch((err) => console.error('Error sonido:', err));
      }

      this.ctx.save();
      this.ctx.clearRect(0, 0, 400, 400);
      this.ctx.translate(200, 200);
      this.ctx.rotate((this.rotation * Math.PI) / 180);
      this.ctx.translate(-200, -200);
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
}
