/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  let prefix = 'home-';
  let targetRam = ns.getServerMaxRam(prefix+'0')*2;
  if (targetRam > ns.getPurchasedServerMaxRam){
    ns.tprint("MAXIMUM ALLOWED RAM AQUIRED");
    ns.exit();
  }
  let upgradeCost = ns.getPurchasedServerUpgradeCost(prefix+'0',targetRam);
  let myMoney = ns.getPlayer().money;
  if (upgradeCost*ns.getPurchasedServerLimit() < myMoney){
    ns.print("INFO: doing the upgrade to ", targetRam, "GB");
    for (let i=0;i<ns.getPurchasedServerLimit();i++){
      ns.upgradePurchasedServer(prefix+i,targetRam);
    }
    ns.run('deployer_v2.js');
  }else{
    ns.closeTail();
    ns.tprint("WARN: We will need ", (upgradeCost*ns.getPurchasedServerLimit())/1000000,"m$ to upgrade all servers");
  }
}