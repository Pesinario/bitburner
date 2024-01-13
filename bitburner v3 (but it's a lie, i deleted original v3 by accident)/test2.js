/** @param {NS} ns */
export async function main(ns) {
ns.tail();
while (true){
  await ns.sleep(250);
  ns.print(ns.getSharePower());
}
}