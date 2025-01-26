export const calculatePersonalityType = (answers: number[]) => {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  // E/I questions (0-7)
  for (let i = 0; i < 8; i++) {
    if (answers[i] > 3) scores.E += 1;
    else if (answers[i] < 3) scores.I += 1;
  }

  // S/N questions (8-15)
  for (let i = 8; i < 16; i++) {
    if (answers[i] > 3) scores.S += 1;
    else if (answers[i] < 3) scores.N += 1;
  }

  // T/F questions (16-23)
  for (let i = 16; i < 24; i++) {
    if (answers[i] > 3) scores.T += 1;
    else if (answers[i] < 3) scores.F += 1;
  }

  // J/P questions (24-31)
  for (let i = 24; i < 32; i++) {
    if (answers[i] > 3) scores.J += 1;
    else if (answers[i] < 3) scores.P += 1;
  }

  return [
    scores.E > scores.I ? 'E' : 'I',
    scores.S > scores.N ? 'S' : 'N',
    scores.T > scores.F ? 'T' : 'F',
    scores.J > scores.P ? 'J' : 'P'
  ].join('');
};