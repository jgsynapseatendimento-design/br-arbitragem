/**
 * Poses dos jogadores em graus (sistema local do jogador, olhando para +x, pés em y = 0).
 * Ângulo negativo leva o membro para a frente; positivo, para trás. bodyY desloca o corpo
 * (negativo = salto). As medidas espelham a marcação SVG gerada em index.html.
 */
export const JOINTS = ['thighF', 'shinF', 'thighB', 'shinB', 'torso', 'head', 'armF', 'foreF', 'armB', 'foreB'];

export const POSES = {
  neutral: { bodyY: 3, thighF: -14, shinF: 22, thighB: 12, shinB: 18, torso: 8, head: -4, armF: -20, foreF: -35, armB: 28, foreB: -25 },
  crouch: { bodyY: 9, thighF: -30, shinF: 48, thighB: 16, shinB: 44, torso: 16, head: -10, armF: -35, foreF: -40, armB: 35, foreB: -30 },
  kickWind: { bodyY: 4, thighF: 38, shinF: 55, thighB: -4, shinB: 10, torso: 2, head: -6, armF: -55, foreF: -25, armB: 50, foreB: -20 },
  kickPeak: { bodyY: 0, thighF: -88, shinF: -4, thighB: 6, shinB: 14, torso: -20, head: -14, armF: -95, foreF: -15, armB: 70, foreB: -25 },
  headPrep: { bodyY: 10, thighF: -28, shinF: 52, thighB: 18, shinB: 50, torso: -14, head: -22, armF: -60, foreF: -30, armB: -40, foreB: -30 },
  headPeak: { bodyY: -24, thighF: -18, shinF: 48, thighB: 14, shinB: 62, torso: 14, head: 26, armF: -140, foreF: -15, armB: -110, foreB: -20 },
};

// Medidas do esqueleto (iguais às da marcação SVG).
const HIP_Y = -70;
const THIGH = 34;
const TOE = { x: 11, y: 33 }; // ponta do pé, a partir do joelho
const NECK = { x: 1, y: -50 }; // a partir do quadril
const FOREHEAD = { x: 11, y: -21 }; // a partir do pescoço
const BALL_R = 10; // raio da bola em unidades do jogador (12 px na tela, escala 1,23)

const rad = (deg) => (deg * Math.PI) / 180;
const rot = (p, deg) => {
  const a = rad(deg);
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
};
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });

/** Centro da bola apoiada no peito do pé da perna da frente. */
export function footContact(pose) {
  const hip = { x: 0, y: HIP_Y + pose.bodyY };
  const knee = add(hip, rot({ x: 0, y: THIGH }, pose.thighF));
  const toe = add(knee, rot(TOE, pose.thighF + pose.shinF));
  return add(toe, { x: 0, y: -BALL_R - 4 });
}

/** Centro da bola encostada na testa. */
export function headContact(pose) {
  const hip = { x: 0, y: HIP_Y + pose.bodyY };
  const forehead = add(hip, rot(add(NECK, rot(FOREHEAD, pose.head)), pose.torso));
  return add(forehead, rot({ x: BALL_R * 0.8, y: -BALL_R * 0.6 }, pose.torso + pose.head));
}
