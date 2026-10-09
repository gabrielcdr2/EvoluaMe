import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>EvoluaMe</title>

        <ScrollViewStyleReset />
      </head>

      <body>
        {children}

        <div {...{ vw: "" }} className="enabled">
          <div {...{ "vw-access-button": "" }} className="active" />
          <div {...{ "vw-plugin-wrapper": "" }}>
            <div className="vw-plugin-top-wrapper" />
          </div>
        </div>

        <script src="https://vlibras.gov.br/app/vlibras-plugin.js" defer />
      </body>
    </html>
  );
}
