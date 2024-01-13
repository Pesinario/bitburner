/** @param {NS} ns */
export function CrackAttempt(ns, target, layers) {
  const cracks_that_exist = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe",
  ]
  const available_cracks = []
  for (let i = 0; i < cracks_that_exist.length; i++) { // checks if we have that many 0days
    if (ns.fileExists(cracks_that_exist[i])) {
      available_cracks.push(cracks_that_exist[i])
    }
  }
  if (available_cracks.length >= layers) { // if we do, applies them and returns true
    ns.print("WARN: cracker should crack " + layers + " layers")
    switch (layers) {
      case 1:
        layers = 1
        ns.brutessh(target)
        break
      case 2:
        layers = 2
        ns.brutessh(target)
        ns.ftpcrack(target)
        break
      case 3:
        layers = 3
        ns.brutessh(target)
        ns.ftpcrack(target)
        ns.relaysmtp(target)
        break
      case 4:
        layers = 4
        ns.brutessh(target)
        ns.ftpcrack(target)
        ns.relaysmtp(target)
        ns.httpworm(target)
        break
      case 5:
        layers = 5
        ns.brutessh(target)
        ns.ftpcrack(target)
        ns.relaysmtp(target)
        ns.httpworm(target)
        ns.sqlinject(target)
        break
    }
    return true
  } else { // if we dont, returns false
    return false
  }
}