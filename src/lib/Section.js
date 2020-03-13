import Component from 'brindille-component'

export default class Section extends Component {
  transitionIn(callback) {
    gsap.fromTo(
      this.$el,
      { alpha: 0 },
      {
        duration: 0.5,
        alpha: 1,
        onComplete: () => {
          callback()
        }
      }
    )
  }

  transitionOut(callback) {
    gsap.to(this.$el, {
      duration: 0.5,
      alpha: 0,
      onComplete: () => {
        callback()
      }
    })
  }
}
