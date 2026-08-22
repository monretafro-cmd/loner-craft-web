import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_shell/media')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/_shell/media"!</div>
}
