import { createHash } from 'crypto';

export interface QuestionDef {
  display: string;
  answer: number;
}

export function generateQuestion(seed: string, index: number): QuestionDef {
  const hash = createHash('sha256').update(`${seed}-${index}`).digest();
  
  let byteIdx = 0;
  const nextInt = (min: number, max: number) => {
    const range = max - min + 1;
    const val = (hash[byteIdx++] << 8) | hash[byteIdx++];
    return min + (val % range);
  };
  
  const qNum = index + 1;
  let numCount = 2;
  let maxRange = 20;
  let ops = ['+', '-'];
  let isTier3 = false;
  
  if (qNum >= 1 && qNum <= 3) {
    numCount = 2;
    maxRange = 20;
    ops = ['+', '-'];
  } else if (qNum >= 4 && qNum <= 6) {
    numCount = 2;
    maxRange = 50;
    ops = ['+', '-', '*'];
  } else if (qNum >= 7 && qNum <= 10) {
    numCount = 3;
    maxRange = 100;
    ops = ['+', '-', '*'];
    isTier3 = true;
  }
  
  let numbers: number[] = [];
  let operators: string[] = [];
  
  for (let i = 0; i < numCount; i++) {
     numbers.push(nextInt(1, maxRange));
  }
  for (let i = 0; i < numCount - 1; i++) {
     operators.push(ops[nextInt(0, ops.length - 1)]);
  }
  
  // Cap multiplication at 12x12
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '*') {
      numbers[i] = nextInt(1, 12);
      numbers[i+1] = nextInt(1, 12);
    }
  }
  
  let result = numbers[0];
  let display = `${numbers[0]}`;
  
  for (let i = 0; i < operators.length; i++) {
    const op = operators[i];
    const nextNum = numbers[i+1];
    
    display += ` ${op === '*' ? '×' : op === '-' ? '−' : '+'} ${nextNum}`;
    
    if (op === '+') result += nextNum;
    else if (op === '-') result -= nextNum;
    else if (op === '*') result *= nextNum;
  }
  
  return { display, answer: result };
}

export function calculateScore(index: number, elapsedMs: number): number {
  if (elapsedMs > 12000) return 0; // 10s + 2s grace window for network latency
  
  // "remaining_seconds" is floored or rounded? Let's assume math.ceil or floor.
  // 9.5s elapsed -> 0.5s remaining -> remaining_seconds = 0
  const remainingSeconds = Math.max(0, 10 - Math.floor(elapsedMs / 1000));
  
  const qNum = index + 1;
  let multiplier = 1;
  if (qNum >= 4 && qNum <= 6) multiplier = 1.5;
  if (qNum >= 7 && qNum <= 10) multiplier = 2;
  
  return (100 * multiplier) + (remainingSeconds * 10);
}
