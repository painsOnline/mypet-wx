<template>
  <image
    :class="{ 'pet-img-fade-in': showAnim }"
    :src="displaySrc"
    :mode="imgMode"
    @load="onLoad"
    @error="onError"
    @tap="$emit('click')"
  />
</template>

<script>
export default {
  name: 'PetLazyImage',
  props: {
    image: { type: String, default: '' },
    imgMode: { type: String, default: 'widthFix' },
    loadingImg: { type: String, default: '/static/images/loading.gif' },
    errorImg: { type: String, default: '/static/images/loading.gif' },
  },
  emits: ['click'],
  data() {
    return {
      displaySrc: '',
      showAnim: false,
      _startTime: 0,
      _swapTimer: null,
    }
  },
  watch: {
    image: {
      immediate: true,
      handler(val) {
        clearTimeout(this._swapTimer)
        this.showAnim = false
        if (!val) {
          this.displaySrc = this.loadingImg
          return
        }
        this.displaySrc = this.loadingImg
        this._startTime = Date.now()
        uni.getImageInfo({
          src: val,
          success: () => {
            // loading.gif 至少展示 300ms，确保用户能看到
            const elapsed = Date.now() - this._startTime
            const delay = Math.max(300 - elapsed, 30)
            this._swapTimer = setTimeout(() => {
              this.displaySrc = val
            }, delay)
          },
          fail: () => {
            this.displaySrc = this.errorImg
          },
        })
      },
    },
  },
  methods: {
    onLoad() {
      if (this.displaySrc !== this.loadingImg && this.displaySrc !== this.errorImg) {
        this.showAnim = true
      }
    },
    onError() {
      if (this.displaySrc !== this.errorImg) {
        this.displaySrc = this.errorImg
      }
    },
  },
}
</script>

<style scoped>
.pet-img-fade-in {
  animation: petFadeIn 0.5s ease-out;
}

@keyframes petFadeIn {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>
