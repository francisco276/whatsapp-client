import parsePhoneNumber, { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js"

const REGEX_GROUP = /^.+@g\.us$/
const WA_SUFFIX_JID = '@s.whatsapp.net'

export const isWhatsAppGroup = (jid: string): boolean => {
  return REGEX_GROUP.test(jid)
}

export const formatPhoneToWhatsAppJID = (phoneNumber: string, countryShortName: CountryCode): string => {
  if (!phoneNumber) throw new Error('Phone number is required')

  try {
    const parsedNumber = parsePhoneNumber(phoneNumber, countryShortName)

    if (parsedNumber === undefined || !parsedNumber.isValid()) {
      throw new Error('Invalid phone number')
    }

    const countryCode = parsedNumber.countryCallingCode
    const country = parsedNumber.country
    let nationalNumber = parsedNumber.nationalNumber.replace(/^0+/, '')

    let formattedNumber: string

    // Apply WhatsApp-specific rules
    switch (country) {
      case 'AR': // Argentina: +54 9 XXX XXX XXXX
        if (nationalNumber.startsWith('15')) {
          nationalNumber = nationalNumber.substring(2)
        }
        formattedNumber = `${countryCode}9${nationalNumber}`
        break;

      case 'MX': // Mexico: +52 1 XXX XXX XXXX
        formattedNumber = `${countryCode}1${nationalNumber}`
        break

      default: // All other countries
        formattedNumber = `${countryCode}${nationalNumber}`
        break
    }

    return `${formattedNumber}${WA_SUFFIX_JID}`
  } catch (error) {
    throw new Error('Failed to parse phone number')
  }
}

export const jidToFormatedPhone = (jid: string = '') => {
  let raw = jid.replace(/:.*|@s\.whatsapp\.net/g, '')

  if (raw.includes('@')) {
    raw = raw.split('@')[0]
  }

  if (!raw || !/^\d+$/.test(raw)) return null

  if (raw.startsWith('521') && raw.length === 13) {
    raw = '52' + raw.slice(3)
  }

  if (raw.startsWith('549') && raw.length >= 12) {
    raw = '54' + raw.slice(3)
  }

  const phone = parsePhoneNumberFromString('+' + raw)

  if (phone && phone.isValid()) {
    return phone.formatInternational()
  }

  return '+' + raw.replace(/(\d{1,3})(?=(\d{4})+(?!\d))/g, '$1 ').trim()
}
