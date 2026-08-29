import { CornerAnalysisEngine, CarSetupParameters } from "../racing/cornerAnalysisEngine";
// ============================================================================
// RACE ENGINEERING SUITE — AI RACE ENGINEER ASSISTANT
// ============================================================================
// Intelligent race engineer that analyzes real-time data and provides
// tactical advice on pit stops, tire strategy, fuel management, weather
// changes, and driver coaching during race sessions.
// ============================================================================

export interface EngineerMessage {
  id: string;
  timestamp: number;
  category: 'strategy' | 'tire' | 'fuel' | 'weather' | 'gap' | 'car' | 'danger' | 'radio' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: Record<string, unknown>;
}

export interface EngineerContext {
  currentLap: number;
  totalLaps: number;
  position: number;
  totalCars: number;
  tireCompound: string;
  tireWear: number;
  tireTemp: number;
  fuelRemaining: number;
  fuelLaps: number;
  gapAhead: number;
  gapBehind: number;
  lapTimeLast: number;
  lapTimeBest: number;
  sectorTimes: [number, number, number];
  trackTemp: number;
  airTemp: number;
  rainIntensity: number;
  rainProbability: number;
  safetyCarActive: boolean;
  drsEnabled: boolean;
  recentLapTimes: number[];
  positionChanges: number[];
}

export class RaceEngineerAI {
  private messages: EngineerMessage[] = [];
  private messageId = 0;
  private lastAdviceTime: number = 0;
  private adviceCooldown = 5;

  public analyze(context: EngineerContext): EngineerMessage[] {
    const newMessages: EngineerMessage[] = [];
    if (context.currentLap - this.lastAdviceTime < this.adviceCooldown) return newMessages;

    // Tire strategy advice
    if (context.tireWear > 70) {
      newMessages.push(this.createMessage('tire', 'high',
        `Tires at ${Math.round(context.tireWear)}% wear. Performance dropping. Box within ${Math.max(1, Math.round((100 - context.tireWear) / 5))} laps for new rubber.`,
        { tireWear: context.tireWear }));
    } else if (context.tireWear > 50 && context.tireWear < 55) {
      newMessages.push(this.createMessage('tire', 'medium',
        `Tires at midpoint. Degradation ${context.tireWear > 55 ? 'above' : 'at'} expected rate. Monitoring.`, {}));
    }

    if (context.tireTemp > 120) {
      newMessages.push(this.createMessage('tire', 'high',
        `Tire temps ${context.tireTemp}\u00B0C - overheating! Lift and coast through next few corners to cool them.`, {}));
    }

    // Fuel management
    if (context.fuelLaps < context.totalLaps - context.currentLap + 2) {
      newMessages.push(this.createMessage('fuel', 'high',
        `Fuel is tight. We need to save ~${(context.fuelLaps - (context.totalLaps - context.currentLap)).toFixed(1)} laps worth. Switch to fuel saving mode.`, {}));
    } else if (context.fuelRemaining > (context.totalLaps - context.currentLap) * 0.05 + 2) {
      newMessages.push(this.createMessage('fuel', 'low',
        `Good fuel margin. +${((context.fuelRemaining - (context.totalLaps - context.currentLap) * 0.02) * 100).toFixed(0)}g spare. You can push.`, {}));
    }

    // Gap analysis
    if (context.gapAhead < 1.0 && context.gapAhead > 0) {
      newMessages.push(this.createMessage('gap', 'high',
        `Gap to car ahead: ${context.gapAhead.toFixed(1)}s. DRS range. Attack into next braking zone.`, {}));
    }
    if (context.gapBehind < 1.5 && context.gapBehind > 0) {
      newMessages.push(this.createMessage('gap', 'medium',
        `Gap behind: ${context.gapBehind.toFixed(1)}s. Defend position. Watch inside line.`, {}));
    }

    // Weather alerts
    if (context.rainProbability > 60 && context.rainIntensity < 0.1) {
      newMessages.push(this.createMessage('weather', 'high',
        `Rain forecast: ${context.rainProbability}% chance in the next 10 minutes. Consider boxing for inters if it arrives.`, {}));
    }
    if (context.rainIntensity > 0.3 && context.tireCompound !== 'intermediate' && context.tireCompound !== 'wet') {
      newMessages.push(this.createMessage('weather', 'critical',
        `Rain intensifying! ${context.rainIntensity > 0.6 ? 'Heavy rain' : 'Rain'} detected. Box now for ${context.rainIntensity > 0.5 ? 'full wets' : 'intermediates'}!`, {}));
    }

    // Pace coaching
    if (context.recentLapTimes.length >= 3) {
      const avg = context.recentLapTimes.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const trend = context.recentLapTimes[context.recentLapTimes.length - 1] - context.recentLapTimes[context.recentLapTimes.length - 3];
      if (trend > 0.5) {
        newMessages.push(this.createMessage('car', 'medium',
          `Lap times dropping off. Last 3 laps: +${trend.toFixed(1)}s trend. Check tire balance and brake bias.`, {}));
      }
    }

    // Safety car
    if (context.safetyCarActive && context.currentLap > 0) {
      newMessages.push(this.createMessage('strategy', 'critical',
        `Safety car deployed! Box now if you haven't stopped - free pit stop!`, {}));
    }

    // Position changes
    if (context.positionChanges.length > 0) {
      const lastChange = context.positionChanges[context.positionChanges.length - 1];
      if (lastChange < 0) {
        newMessages.push(this.createMessage('info', 'medium',
          `P${context.position}. Good overtake! Keep pushing.`, {}));
      } else if (lastChange > 0) {
        newMessages.push(this.createMessage('info', 'medium',
          `P${context.position}. Lost a position. Let's focus and get it back.`, {}));
      }
    }

    if (newMessages.length > 0) {
      this.lastAdviceTime = context.currentLap;
      this.messages.push(...newMessages);
    }

    return newMessages;
  }

  private createMessage(category: EngineerMessage['category'], priority: EngineerMessage['priority'], message: string, data: Record<string, unknown>): EngineerMessage {
    return {
      id: `eng_${++this.messageId}`,
      timestamp: Date.now(),
      category,
      priority,
      message,
      data,
    };
  }

  private carParams: CarSetupParameters | null = null;
  public setCarParameters(p: CarSetupParameters): void { this.carParams = p; }
  public answerQuestion(q: string): string { const c=this.carParams;if(!c)return "Configure your car first.";const ql=q.toLowerCase();if(ql.includes("understeer")){const fg=c.tireWidthFront*(1+c.frontWingAngle*0.03);const rg=c.tireWidthRear*(1+c.rearWingAngle*0.03);const b=fg/rg;return b<0.85?"Understeer detected. Grip ratio: "+b.toFixed(2)+". Fix: increase front wing to "+(c.frontWingAngle+2)+"°, widen front tires to "+(c.tireWidthFront+20)+"mm.":"Balance is OK ("+b.toFixed(2)+" grip ratio).";}if(ql.includes("oversteer")){const fg=c.tireWidthFront*(1+c.frontWingAngle*0.03);const rg=c.tireWidthRear*(1+c.rearWingAngle*0.03);const b=fg/rg;return b>1.2?"Oversteer detected. Grip ratio: "+b.toFixed(2)+". Fix: increase rear wing to "+(c.rearWingAngle+2)+"°, increase diff lock to "+Math.min(90,c.differentialLock+20)+"%.":"Balance is OK ("+b.toFixed(2)+" grip ratio).";}if(ql.includes("top speed")||ql.includes("drag")){return "Top speed limited by Cd="+c.dragCoefficient+", power/weight="+(c.power/c.weight).toFixed(2)+" hp/kg. Reduce rear wing for +10 km/h or keep for cornering grip.";}if(ql.includes("weight")||ql.includes("heavy")){return "Car weighs "+c.weight+"kg ("+c.weightDistribution+"% front). "+(c.weight>800?"Too heavy. Switch to carbon chassis and lightweight panels.":"Good weight.")+"";}if(ql.includes("monaco")){return "Monaco: max downforce, soft tires, high diff lock ("+c.differentialLock+"%), stiff suspension.";}if(ql.includes("optimize")||ql.includes("improve")){var r=CornerAnalysisEngine.analyzeTrack("monaco",c);var s=r.corners.filter(function(x){return x.issueSeverity==="severe";});return s.length>0?"Critical: "+s.map(function(x){return x.issueDescription;}).join("; ")+". Fix these first.":"Car is balanced. Focus on tire management.";}return "Ask about: understeer, oversteer, top speed, weight, Monaco setup, or optimization.";}
  public getMessages(): EngineerMessage[] { return [...this.messages]; }
  public getRecentMessages(count: number): EngineerMessage[] { return this.messages.slice(-count); }
  public clearMessages(): void { this.messages = []; }
}
