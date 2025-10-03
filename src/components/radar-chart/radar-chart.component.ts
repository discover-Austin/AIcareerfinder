import { Component, ChangeDetectionStrategy, input, effect, viewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraitScoreData } from '../../models/personality-test.model';

// Chart.js is loaded from a CDN script in index.html, so it's available as a global.
declare var Chart: any;

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="relative w-full h-full min-h-[300px] md:min-h-[400px]"><canvas #chartCanvas></canvas></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent implements OnDestroy {
  chartData = input.required<TraitScoreData>();
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  
  private chart: any;

  constructor() {
    // This effect is created in an injection context and will run when either
    // the `canvas` signal is resolved or the `chartData` input changes.
    effect(() => {
      this.createChart();
    });
  }

  ngOnDestroy(): void {
    // Ensure the chart instance is destroyed when the component is removed.
    this.chart?.destroy();
  }

  private createChart(): void {
    // The effect will re-run if chartData changes.
    // We also need to make sure the canvas is available, which the effect handles
    // by tracking the `this.canvas()` signal.
    if (!this.chartData()) return;

    const canvasEl = this.canvas()?.nativeElement;
    if (!canvasEl) return;
    
    // Destroy the previous chart instance before creating a new one to prevent memory leaks.
    this.chart?.destroy();

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const pointLabelColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridAndAngleColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    const ticksColor = isDarkMode ? '#94a3b8' : '#64748b';


    this.chart = new Chart(ctx, {
      type: 'radar',
      data: this.chartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: gridAndAngleColor },
            grid: { color: gridAndAngleColor },
            pointLabels: { 
                font: { size: 12 },
                color: pointLabelColor
            },
            ticks: {
              backdropColor: 'transparent',
              color: ticksColor,
              stepSize: 25
            },
            min: 0,
            max: 100
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
