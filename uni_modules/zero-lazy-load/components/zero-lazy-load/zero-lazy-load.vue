<template>
	<view class="zero-content" :style="{
		opacity: Number(opacity),
		borderRadius: borderRadius + 'rpx',
		// 因为time值需要改变,所以不直接用duration值(不能改变父组件prop传过来的值)
		transition: `opacity ${time / 1000}s ${effect}`
	}" :class="['zero-content-inner', 'zero-lazy-item-' + elIndex, { 'zero-content--loading': showShimmer }]">
		<view :class="'zero-lazy-item-' + elIndex" class="zero-lazy-stage">
			<view v-if="showShimmer" class="zero-lazy-shimmer" :style="{ borderRadius: borderRadius + 'rpx' }"></view>
			<view v-if="showDefaultLoadingIcon" class="zero-lazy-placeholder-icon-wrap">
				<view class="zero-lazy-placeholder-icon">
					<view class="zero-lazy-placeholder-sun"></view>
					<view class="zero-lazy-placeholder-mountain zero-lazy-placeholder-mountain--left"></view>
					<view class="zero-lazy-placeholder-mountain zero-lazy-placeholder-mountain--right"></view>
				</view>
			</view>
			<view v-if="showDefaultErrorIcon" class="zero-lazy-placeholder-icon-wrap">
				<view class="zero-lazy-placeholder-icon zero-lazy-placeholder-icon--error">
					<view class="zero-lazy-placeholder-sun"></view>
					<view class="zero-lazy-placeholder-mountain zero-lazy-placeholder-mountain--left"></view>
					<view class="zero-lazy-placeholder-mountain zero-lazy-placeholder-mountain--right"></view>
					<view class="zero-lazy-placeholder-error-mark"></view>
				</view>
			</view>
			<image :style="{ borderRadius: borderRadius + 'rpx', height: imgHeight }" v-if="!displayIsError" class="zero-lazy-item"
				:src="currentImageSrc" :mode="imgMode" @load="imgLoaded" @error="loadError" @tap="clickImg">
			</image>
			<image :style="{ borderRadius: borderRadius + 'rpx', height: imgHeight }" class="zero-lazy-item error" v-else
				:src="resolvedErrorImg" :mode="imgMode" @load="errorImgLoaded" @tap="clickImg"></image>
		</view>
	</view>
</template>


<script>
/**
 * lazyLoad 懒加载 (本组件基于uview lazyLoad开发, https://v1.uviewui.com/components/lazyLoad.html)
 * @description 懒加载使用的场景为：页面有很多图片时，APP会同时加载所有的图片，导致页面卡顿，各个位置的图片出现前后不一致等。默认使用 CSS 居中占位图标，传入 loadingImg 或 errorImg 时优先使用自定义图片。
 * @property {String Number} index 用户自定义值，在事件触发时回调，用以区分是哪个图片
 * @property {String} image 图片路径
 * @property {String} threshold 触发加载时的位置，见上方说明，单位 rpx（默认300）
 * @property {String Number} duration 图片加载成功时，淡入淡出时间，单位ms（默认）
 * @property {String} effect 图片加载成功时，淡入淡出的css动画效果（默认ease-in-out）
 * @property {Boolean} is-effect 图片加载成功时，是否启用淡入淡出效果（默认true）
 * @property {String Number} border-radius 图片圆角值，单位rpx（默认0）
 * @property {String Number} height 图片高度，注意：实际高度可能受img-mode参数影响（默认450）
 * @property {String Number} mg-mode 图片的裁剪模式，详见image组件裁剪模式（默认widthFix）
 * @event {Function} click 点击图片时触发
 * @event {Function} load 图片加载成功时触发
 * @event {Function} error 图片加载失败时触发
 * @example <zero-lazy-load :image="image" ></zero-lazy-load>
 */

//验证十进制数字
function number(value) {
	return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
}

// 全局唯一标识符
function guid(len = 32, firstU = true, radix = null) {
	let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	let uuid = [];
	radix = radix || chars.length;

	if (len) {
		// 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
		for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		let r;
		// rfc4122标准要求返回的uuid中,某些位为固定的字符
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		for (let i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}
	// 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
	if (firstU) {
		uuid.shift();
		return 'u' + uuid.join('');
	} else {
		return uuid.join('');
	}
}

const TRANSPARENT_LOADING_IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
export default {
	name: 'zero-lazy-load',
	emits: ['click', 'load', 'error', 'finish'],
	props: {
		index: {
			type: [Number, String]
		},
		// 要显示的图片
		image: {
			type: String,
			default: ''
		},
		// 图片裁剪模式
		imgMode: {
			type: String,
			default: 'widthFix'
		},
		// 自定义加载占位图，可选
		loadingImg: {
			type: String,
			default: ''
		},
		// 自定义失败占位图，可选
		errorImg: {
			type: String,
			default: ''
		},
		// 图片进入可见区域前多少像素时，单位rpx，开始加载图片
		// 负数为图片超出屏幕底部多少距离后触发懒加载，正数为图片顶部距离屏幕底部多少距离时触发(图片还没出现在屏幕上)
		threshold: {
			type: [Number, String],
			default: 100
		},
		// 淡入淡出动画的过渡时间
		duration: {
			type: [Number, String],
			default: 500
		},
		// 渡效果的速度曲线，各个之间差别不大，因为这是淡入淡出，且时间很短，不是那些变形或者移动的情况，会明显
		// linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier(n,n,n,n);
		effect: {
			type: String,
			default: 'ease-in-out'
		},
		// 是否使用过渡效果
		isEffect: {
			type: Boolean,
			default: true
		},
		// 圆角值
		borderRadius: {
			type: [Number, String],
			default: 0
		},
		// 图片高度，单位rpx
		height: {
			type: [Number, String],
			default: '300'
		}
	},
	data() {
		return {
			isShow: false,
			opacity: 1,
			time: this.duration,
			loadStatus: '', // 默认是懒加载中的状态
			isError: false, // 图片加载失败
			demoStatus: '',
			elIndex: guid()
		}
	},
	computed: {
		// 将threshold从rpx转为px
		getThreshold() {
			// 先取绝对值，因为threshold可能是负数，最后根据this.threshold是正数或者负数，重新还原
			let thresholdPx = uni.upx2px(Math.abs(this.threshold));
			return this.threshold < 0 ? -thresholdPx : thresholdPx;
		},
		// 计算图片的高度，可能为auto，带%，或者直接数值
		imgHeight() {
			return this.addUnit(this.height);
		},
		displayIsError() {
			return this.demoStatus ? this.demoStatus === 'error' : this.isError;
		},
		hasCustomLoadingImg() {
			const propsData = this.$options.propsData || {};
			return Object.prototype.hasOwnProperty.call(propsData, 'loadingImg');
		},
		hasCustomErrorImg() {
			const propsData = this.$options.propsData || {};
			return Object.prototype.hasOwnProperty.call(propsData, 'errorImg');
		},
		resolvedLoadingImg() {
			return this.hasCustomLoadingImg ? this.loadingImg : TRANSPARENT_LOADING_IMG;
		},
		resolvedErrorImg() {
			return this.hasCustomErrorImg ? this.errorImg : TRANSPARENT_LOADING_IMG;
		},
		showDefaultLoadingIcon() {
			return this.showShimmer && !this.hasCustomLoadingImg;
		},
		showDefaultErrorIcon() {
			return this.displayIsError && !this.hasCustomErrorImg;
		},
		currentImageSrc() {
			if (this.demoStatus === 'loaded') return this.image;
			if (this.demoStatus === 'loading') return this.resolvedLoadingImg;
			return this.isShow ? this.image : this.resolvedLoadingImg;
		},
		showShimmer() {
			if (this.demoStatus) return this.demoStatus === 'loading';
			return !this.isError && this.loadStatus !== 'loaded';
		}
	},
	created() {
		// 由于一些特殊原因，不能将此变量放到data中定义
		this.observer = {};
	},
	watch: {

		isShow(nVal) {
			// 如果是不开启过渡效果，直接返回
			if (!this.isEffect) return;
			this.time = 0;
			// 原来opacity为1(不透明，是为了显示占位图)，改成0(透明，意味着该元素显示的是背景颜色，默认的白色)，再改成1，是为了获得过渡效果
			this.opacity = 0;
			// 延时30ms，否则在浏览器H5，过渡效果无效
			setTimeout(() => {
				this.time = this.duration;
				this.opacity = 1;
			}, 30)
		},
		// 图片路径发生变化时，需要重新标记一些变量，否则会一直卡在某一个状态，比如isError
		image(n) {
			if (!n) {
				// 如果传入null或者''，或者undefined，标记为错误状态
				this.isError = true;
			} else {
				this.init();
				this.isError = false;

				//  // 创建一个Image对象来检测图片是否加载成功
				//     const img = new Image();
				//     img.onerror = () => {
				//       // 图片加载失败
				//       this.loadError();
				//     };
				//     img.src = n;
			}
		}
	},
	methods: {
		// 用于demo改变展示状态
		changeStatus(val) {
			if (val === 0) {
				this.demoStatus = 'loading';
				this.isShow = false;
				this.loadStatus = 'lazyed';
				this.isError = false;
			} else if (val === 1) {
				this.demoStatus = 'error';
				this.isShow = false;
				this.loadStatus = '';
				this.isError = true;
			} else {
				this.demoStatus = 'loaded';
				this.loadStatus = 'loaded';
				this.isError = false;
				this.isShow = true;

			}

		},
		addUnit(value = 'auto', unit = 'rpx') {
			value = String(value);
			return number(value) ? `${value}${unit}` : value;
		},
		// 用于重新初始化
		init() {
			this.demoStatus = '';
			this.isError = false;
			this.loadStatus = '';
		},
		// 点击图片触发的事件,loadlazy-还是懒加载中状态，loading-图片正在加载，loaded-图片加加载完成
		clickImg() {
			let whichImg = '';
			// 如果isShow为false，意味着图片还没开始加载，点击的只能是最开始的占位图
			if (this.isShow == false) whichImg = 'lazyImg';
			// 如果isError为true，意味着图片加载失败，这是只剩下错误的占位图，所以点击的只能是错误占位图
			// 当然，也可以给错误的占位图元素绑定点击事件，看你喜欢~
			else if (this.isError == true) whichImg = 'errorImg';
			// 总共三张图片，除了两个占位图，剩下的只能是正常的那张图片了
			else whichImg = 'realImg';
			// 只通知当前图片的index
			this.$emit('click', this.index);
		},
		// 图片加载完成事件，可能是加载占位图时触发，也可能是加载真正的图片完成时触发，通过isShow区分
		imgLoaded() {
			if (this.demoStatus) return;
			// 占位图加载完成
			if (this.loadStatus == '') {
				this.loadStatus = 'lazyed';
			}
			// 真正的图片加载完成 
			else if (this.loadStatus == 'lazyed') {
				this.loadStatus = 'loaded';
				this.$emit('load', this.index);
				// 成功与否都传出,看情况使用哪个
				this.$emit('finish', this.index);
			}
		},
		// 错误的图片加载完成
		errorImgLoaded() {
			if (this.demoStatus) return;
			this.$emit('error', this.index);
			// 成功与否都传出,看情况使用哪个
			this.$emit('finish', this.index);
		},
		// 图片加载失败
		loadError() {
			if (this.demoStatus) return;
			this.isError = true;
			this.$emit('error', this.index);
			// 成功与否都传出,看情况使用哪个
			this.$emit('finish', this.index);
		},
		disconnectObserver(observerName) {
			const observer = this[observerName];
			observer && observer.disconnect();
		},
	},
	beforeDestroy() {
		// 销毁页面时，可能还没触发某张很底部的懒加载图片，所以把这个事件给去掉
		//observer.disconnect();
	},
	mounted() {
		// 由父组件生命周期onReachBottom发出，目的是让页面到底时，保证所有图片都进行加载，做到绝对稳定且可靠
		this.$nextTick(() => {
			uni.$once('onReachBottom', () => {
				// console.log('触底监听')
				if (!this.isShow) this.isShow = true;
			});
		})
		// mounted的时候，不一定挂载了这个元素，延时30ms，否则会报错或者不报错，但是也没有效果
		setTimeout(() => {
			// 这里是组件内获取布局状态，不能用uni.createIntersectionObserver，而必须用this.createIntersectionObserver
			this.disconnectObserver('contentObserver');
			const contentObserver = uni.createIntersectionObserver(this);
			// 要理解IntersectionObserver工作原理,可参考：
			// https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
			// 或
			// https://blog.csdn.net/qq_25324335/article/details/83687695
			contentObserver.relativeToViewport({
				bottom: this.getThreshold,
			}).observe('.zero-lazy-item-' + this.elIndex, (res) => {
				if (res.intersectionRatio > 0) {
					// 懒加载状态改变
					this.isShow = true;
					// 如果图片已经加载，去掉监听，减少性能的消耗
					this.disconnectObserver('contentObserver');
				}
			})
			this.contentObserver = contentObserver;
		}, 30)
	}
}
</script>

<style  lang="scss" scoped>
.zero-content {
	overflow: hidden;
}

.zero-content-inner {
	position: relative;
}

.zero-lazy-stage {
	position: relative;
}

.zero-content--loading .zero-lazy-item {
	animation: zero-lazy-breathe 1.8s ease-in-out infinite;
}

.zero-lazy-item {
	width: 100%;
	position: relative;
	// 骗系统开启硬件加速
	transform: transition3d(0, 0, 0);
	// 防止图片加载“闪一下”
	will-change: transform;
	/* #ifndef APP-NVUE */
	display: block;
	/* #endif */
}

.zero-lazy-shimmer {
	position: absolute;
	inset: 0;
	z-index: 2;
	overflow: hidden;
	pointer-events: none;
	animation: zero-lazy-overlay-fade 1.8s ease-in-out infinite;
}

.zero-lazy-placeholder-icon-wrap {
	position: absolute;
	inset: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.zero-lazy-placeholder-icon {
	position: relative;
	width: 88rpx;
	height: 70rpx;
	border: 4rpx solid rgba(151, 166, 184, 0.62);
	border-radius: 8rpx;
	box-sizing: border-box;
	opacity: 0.88;
}

.zero-lazy-placeholder-icon--error {
	border-color: rgba(151, 166, 184, 0.52);
	opacity: 0.78;
}

.zero-lazy-placeholder-sun {
	position: absolute;
	top: 14rpx;
	left: 16rpx;
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: rgba(151, 166, 184, 0.62);
}

.zero-lazy-placeholder-mountain {
	position: absolute;
	bottom: 12rpx;
	height: 0;
	border-style: solid;
	border-color: transparent transparent rgba(151, 166, 184, 0.62) transparent;
}

.zero-lazy-placeholder-mountain--left {
	left: 14rpx;
	border-width: 0 14rpx 18rpx 14rpx;
}

.zero-lazy-placeholder-mountain--right {
	left: 36rpx;
	border-width: 0 16rpx 22rpx 16rpx;
}

.zero-lazy-placeholder-icon--error .zero-lazy-placeholder-sun,
.zero-lazy-placeholder-icon--error .zero-lazy-placeholder-mountain {
	opacity: 0.72;
}

.zero-lazy-placeholder-error-mark {
	position: absolute;
	right: -10rpx;
	top: -10rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: rgba(118, 132, 150, 0.96);
	box-shadow: 0 2rpx 8rpx rgba(118, 132, 150, 0.16);
}

.zero-lazy-placeholder-error-mark::before,
.zero-lazy-placeholder-error-mark::after {
	content: '';
	position: absolute;
	left: 50%;
	top: 50%;
	width: 18rpx;
	height: 3.5rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 1);
	transform-origin: center;
}

.zero-lazy-placeholder-error-mark::before {
	transform: translate(-50%, -50%) rotate(45deg);
}

.zero-lazy-placeholder-error-mark::after {
	transform: translate(-50%, -50%) rotate(-45deg);
}

.zero-lazy-shimmer::before {
	content: '';
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.02) 100%);
	opacity: 0.28;
}

.zero-lazy-shimmer::after {
	content: '';
	position: absolute;
	top: 0;
	left: -160%;
	width: 58%;
	height: 100%;
	background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 18%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 255, 255, 0.12) 82%, rgba(255, 255, 255, 0) 100%);
	transform: skewX(-22deg);
	animation: zero-lazy-shimmer 1.45s ease-in-out infinite;
	will-change: transform;
}

@keyframes zero-lazy-breathe {
	0% {
		opacity: 0.86;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.86;
	}
}

@keyframes zero-lazy-overlay-fade {
	0% {
		opacity: 0.45;
	}
	50% {
		opacity: 0.9;
	}
	100% {
		opacity: 0.45;
	}
}

@keyframes zero-lazy-shimmer {
	0% {
		left: -160%;
	}
	100% {
		left: 180%;
	}
}
</style>
