import { Api } from "telegram";

const getButtons = (buttons: [string, string][]) => new Api.ReplyInlineMarkup({
  rows: [
    new Api.KeyboardButtonRow({
      buttons: buttons.map(([ text, url ]) => new Api.KeyboardButtonWebView({
        text,
        url
      }))
    })
  ]
})

export default getButtons
