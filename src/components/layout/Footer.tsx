export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SignalForge. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
