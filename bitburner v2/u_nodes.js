/** @param {NS} ns */
export function GetAllNodes(ns, p_start = ns.getHostname()) {
  ns.disableLog('scan')
  var current_adress = p_start.slice(0)
  let shopping_list = [current_adress]
  let visited_nodes = []

  function CheckIfThere(thing, where) {
    for (let i = 0; i < where.length; i++) {
      if (where[i] === thing) {
        return true
      }
    }
    // ns.print("SUCCESS: " + thing + " hasn't been explored yet, returing false.")
    return false
  }

  function AddNeighbors(hopFrom) {
    //ns.print("INFO: AddNeighbors Called with: " + hopFrom)
    visited_nodes.push(hopFrom)
    let neighbors = ns.scan(hopFrom)
    for (let i = 0; i < neighbors.length; i++) {
      shopping_list.push(neighbors[i])
    }
  }

  while (shopping_list.length > 0) {
    // ns.print("Shopping list ("+shopping_list.length + ") : " + shopping_list)
    // ns.print("\n"+"Visited nodes (" + visited_nodes.length + ") : " + visited_nodes)
    if (CheckIfThere(current_adress, visited_nodes)) {
      // ns.print("WARN: " + "this adress was visited: " + current_adress)
      current_adress = shopping_list.shift() // pull new adress
      //ns.print("WARN:" + "new adress to check: " + current_adress)
    } else {
      AddNeighbors(current_adress)
      current_adress = shopping_list.shift() // pull new adress
    }

  }
  return visited_nodes
}
/** @param {NS} ns */
export function GetRootedNodes(ns, p_nodes) {
  let rooted_nodes = []
  let s_nodes = p_nodes.slice(0) // this is SO important
  while (s_nodes.length > 0) {
    let current_node = s_nodes.shift()
    let has_root = ns.hasRootAccess(current_node)
    if (has_root) {
      rooted_nodes.push(current_node)
    }
  }
  return rooted_nodes
}
/** @param {NS} ns */
export function GetRootableNodes(ns, p_nodes) {
  return false
}