import { mediaStyles } from 'lib/media';
import { Html, Head, Main, NextScript } from 'next/document';
import GoogleTagManagerNoScript from 'scripts/google-tag-manager-noscript';

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        <style type="text/css">{mediaStyles}</style>
      </Head>
      <body>
        <GoogleTagManagerNoScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
