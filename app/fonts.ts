import localFont from 'next/font/local'

export const sukhumvitSet = localFont({
  src: [
    {
      path: '../public/fonts/SukhumvitSet-Text.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SukhumvitSet-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/SukhumvitSet-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sukhumvit-set',
  display: 'swap',
})