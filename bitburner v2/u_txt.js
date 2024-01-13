/** @param {NS} ns */
export function ArrayifyMyFile(ns, p_path){
  var only_string = ns.read(p_path)
  var actual_array = only_string.split(',')
  return actual_array
}