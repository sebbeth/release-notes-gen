export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  const p=Deno.run({ cmd: ["echo", "abcd"], stdout: "piped", stderr: "piped" });
  await p.status();

  const output = new TextDecoder().decode(await p.output());
  console.log("out " + output);
}


