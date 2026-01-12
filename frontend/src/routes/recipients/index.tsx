import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/recipients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/recipients/"!</div>
}
