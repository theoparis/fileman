const create = (columns, rows) => ({
  columns: Number.parseInt(columns, 10),
  width: Number.parseInt(columns, 10),
  rows: Number.parseInt(rows, 10),
  height: Number.parseInt(rows, 10),
});

export const termSize = () => {
  // from the npm package 'term-size'
  const { env, stdout, stderr } = process;

  if (stdout && stdout.columns && stdout.rows)
    return create(stdout.columns, stdout.rows);

  if (stderr && stderr.columns && stderr.rows)
    return create(stderr.columns, stderr.rows);

  if (env.COLUMNS && env.LINES) return create(env.COLUMNS, env.LINES);

  return create(80, 24);
};
