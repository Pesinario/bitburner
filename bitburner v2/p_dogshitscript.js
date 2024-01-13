/** @param {NS} ns */
export async function main(ns) {
  var tgt_adress = ns.getHostname() // the target
  // defaults:
  var should_weaken = true
  var should_grow = true
  // getting info:
  var tgt_sec_min = ns.getServerMinSecurityLevel(tgt_adress) // the target's minimum security level
  var tgt_money_max = ns.getServerMaxMoney(tgt_adress)

  while (true) {
    // get updated info
    var tgt_sec_now = ns.getServerSecurityLevel(tgt_adress)
    var tgt_money_now = ns.getServerMoneyAvailable(tgt_adress)

    ns.print("\n")
    ns.print("target security stuff, now and min")
    ns.print(tgt_sec_now)
    ns.print(tgt_sec_min)
    ns.print("\n")
    if (should_weaken) {
      if (tgt_sec_min>(tgt_sec_now*1.1)){
        ns.print("Must Weaken")
        while(tgt_sec_min>(tgt_sec_now*1.1)){
          ns.print("Weaken Start")
          await ns.weaken(tgt_adress)
          ns.print("Weaken End")
        }
      }
    }else{
      ns.print("not asked to weaken")
    }

    ns.print("\n")
    ns.print("target money stuff, now and max")
    ns.print(tgt_money_now)
    ns.print(tgt_money_max)
    ns.print("\n")
    if (should_grow) {
      if (tgt_money_max < (tgt_money_now + (tgt_money_max * 0.2))){
        ns.print("Must Grow")
        while(tgt_money_max < (tgt_money_now + (tgt_money_max * 0.2))){
          ns.print("Grow Start")
         await ns.grow(tgt_adress)
          ns.print("Grow End")
        }
      }
    }else{
      ns.print("not asked to grow")
    }
    
    ns.print("\n")
    await ns.hack(tgt_adress)
    ns.print("\n")
  }
}