/** Runs before React hydrates so PWA layout attributes match on first paint. */
export function PwaShellScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var standalone=window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;document.documentElement.dataset.pwaShell=standalone?'true':'false';if(!standalone)return;var p=location.pathname;var hide=p==='/invoices/new'||/\\/invoices\\/[^/]+\\/edit$/.test(p)||(/^\\/invoices\\/[^/]+$/.test(p)&&p!=='/invoices');document.documentElement.dataset.bottomNav=hide?'hidden':'visible';}catch(e){document.documentElement.dataset.pwaShell='false';}})();`,
      }}
    />
  )
}
