import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_shell/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/_shell/categories"!</div>
}
