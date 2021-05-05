import I18n from 'knight-i18n'
import enTranslations from './translations.en'

/**
 * Contains every translation available to the application
 */
export default class Translations extends I18n {

  constructor() {
    super()

    this.add('en', enTranslations)
  }
}