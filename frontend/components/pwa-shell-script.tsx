/** Runs before React hydrates so bottom padding applies on first paint. */
export function PwaShellScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var standalone=window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;if(!standalone)return;document.documentElement.dataset.pwaShell='true';var p=location.pathname;var hide=p==='/invoices/new'||/\\/invoices\\/[^/]+\\/edit$/.test(p)||(/^\\/invoices\\/[^/]+$/.test(p)&&p!=='/invoices');document.documentElement.dataset.bottomNav=hide?'hidden':'visible';}catch(e){}})();`,
      }}
    />
  )
}
