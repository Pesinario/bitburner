/** @param {NS} ns */
import {
  ensureRam,
  arrayifyMyFile,
  attemptCrackv2,
  getMyCracks
} from 'utils.js'
export async function main(ns) {
  var IS_FIRST_RUN = ns.args[0];
  var SAVE_LOCATION = 'manager_info.txt'
  var MYCRACKS, ALL_SERVERS, SLAVES, TARGETS, SHOULD_TRY_TO_CRACK, MANAGER_INFO_OLD; // this sets the scope to global-ish(it's main, but that's fine)

  if (typeof (IS_FIRST_RUN) == 'undefined') {
    IS_FIRST_RUN = true;
  }

  function runAttempt(ns, scriptName, threadsToRun = 1, hostname = ns.getHostname(), ...argsForScript) {
    if (ensureRam(ns, scriptName, threadsToRun, hostname)) {
      ns.tprint('Running: ' + scriptName);
      ns.run(scriptName, threadsToRun, ...argsForScript); // you have to do ... (rest syntax) when calling a rest variable...for some reason lmao
    } else { // TODO: do exec() in a slave that has available RAM
      ns.alert("RAM ISSUE!!!!! THE MANAGER IS DEAD NOW!");
      ns.exit();
    }
  }

  async function openShop(ns, IS_FIRST_RUN) { // this does all the stuff we need
    ns.clearLog();
    ns.tail();
    ns.tprint("INFO: The manager has arrived");
    ns.disableLog('getServerNumPortsRequired');
    ns.disableLog('sleep');

    if (!ns.fileExists('all_nodes.txt') || IS_FIRST_RUN) {
      runAttempt(ns, 'database_builder.js', 1, 'home', 'mode: allnodes');
      await ns.sleep(500);
    }

    MYCRACKS = getMyCracks(ns);
    ALL_SERVERS = arrayifyMyFile(ns, 'all_nodes.txt');
    SLAVES = ALL_SERVERS.filter(server => ns.hasRootAccess(server) && server != 'home');
    TARGETS = ALL_SERVERS.filter(server => !SLAVES.includes(server) && server != 'home');

    if (IS_FIRST_RUN) {
      SHOULD_TRY_TO_CRACK = true
    } else {
      MANAGER_INFO_OLD = arrayifyMyFile(ns, SAVE_LOCATION)
      if (MANAGER_INFO_OLD[0] == MYCRACKS.length) {
        SHOULD_TRY_TO_CRACK = false
      } else {
        SHOULD_TRY_TO_CRACK = true
      }
    }
  }

  async function closeShop(ns) {
    ns.print("The manager is leaving...");
    await ns.sleep(1000 * (1 / 3)); // 5 seconds
    let saveForNextShift = ['number of cracks'];
    saveForNextShift.splice(0, 1, MYCRACKS.length);
    ns.write(SAVE_LOCATION, String(saveForNextShift), 'w');
    ns.tprint("INFO: The manager left");
    ns.closeTail();
  }

  // start of da thing
  await openShop(ns, IS_FIRST_RUN);

  if (SHOULD_TRY_TO_CRACK) {
    ns.print("INFO: Attempting to do cracks on all unaquired nodes");
    let pwned_servers = 0;
    for (let i = 0; TARGETS.length > i; i++) {
      await ns.sleep(500);
      if (attemptCrackv2(ns, TARGETS[i], ns.getServerNumPortsRequired(TARGETS[i]))) {
        ns.print("INFO: Just Pwned " + TARGETS[i]);
        pwned_servers++;
      } else {
        ns.print("INFO: Cannot yet penetrate " + TARGETS[i] + " [" + ns.getServerNumPortsRequired(TARGETS[i]) + "]");
      }
    }
    if (pwned_servers > 0) {
      ns.print("INFO: We now own [" + pwned_servers + "] new servers");

    } else {
      ns.print("We were unable to crack any new servers with the current cracks");
    }
  }

  if (true) {
    ns.print("INFO: Now doing filechecks");
    let servers_with_files = [];
    for (let i = 0; ALL_SERVERS.length > i; i++) {
      let serverLore = ns.ls(ALL_SERVERS[i], '.lit');
      let serverContracts = ns.ls(ALL_SERVERS[i], '.cct');
      let serverFiles = serverLore.concat(serverContracts)

      if (serverFiles.length > 0) {
        servers_with_files.push(ALL_SERVERS[i]);
      }
    }
    ns.print("INFO: Servers with files: " + servers_with_files);
  }
  ns.run('deployer_v1.js');
  await ns.sleep(1000*10); 
  ns.run('temp/upgrade_once.js');
  await closeShop(ns);
  // end of da thing
  ns.spawn(ns.getScriptName(), { spawnDelay: 1000 * 60 * 2 }, false); // restart the script after 2 minute(s)
}