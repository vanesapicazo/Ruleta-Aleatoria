import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.css'],
})
export class RuletaComponent implements AfterViewInit {
  @ViewChild('wheelCanvas') wheelCanvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  options: string[] = [
    'Premio 1',
    'Premio 2',
    'Premio 3',
    'Premio 4',
    'Premio 5',
    'Premio 6',
  ];
  colors: string[] = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F333FF',
    '#FF33AA',
    '#FFD133',
  ];

  rotation = 0;
  spinning = false;
  selectedOption: string | null = null;

  ngAfterViewInit() {
    const canvas = this.wheelCanvas.nativeElement;
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
      ctx.font = '16px Arial';
      ctx.fillText(this.options[i], 80, 10);
      ctx.restore();
    }
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;

    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = 360 * 5 + extraDegrees;

    const start = performance.now();
    const duration = 4000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.rotation = totalRotation * ease;

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
        this.getResult(totalRotation);
      }
    };

    requestAnimationFrame(animate);
  }

  getResult(totalRotation: number) {
    const degrees = totalRotation % 360;
    const segmentAngle = 360 / this.options.length;
    const index = Math.floor(
      ((360 - degrees + segmentAngle / 2) % 360) / segmentAngle
    );
    this.selectedOption = this.options[index];
  }
}
