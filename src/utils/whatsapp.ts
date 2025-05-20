const REGEX_GROUP = /^.+@g\.us$/

export const isWhatsAppGroup = (jid: string): boolean => {
  return REGEX_GROUP.test(jid)
}
