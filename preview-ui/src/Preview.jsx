import { NavigationMenu, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
export default function Preview() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/32" alt="Logo" className="mr-2" />
            <span className="text-xl font-bold">ChronoTask</span>
          </div>
          <nav className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">Feature 1</NavigationMenuLink>
                  <NavigationMenuLink href="#">Feature 2</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">Solution 1</NavigationMenuLink>
                  <NavigationMenuLink href="#">Solution 2</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">Resource 1</NavigationMenuLink>
                  <NavigationMenuLink href="#">Resource 2</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">Pricing Plan 1</NavigationMenuLink>
                  <NavigationMenuLink href="#">Pricing Plan 2</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenu>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Sign in</Button>
            <Button>Get demo</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
            {/* Left Section */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <img src="https://via.placeholder.com/150x200" alt="Note" className="md:max-w-sm" />
              <img src="https://via.placeholder.com/100x100" alt="Check" className="md:max-w-xs" />
            </div>

            {/* Center Section */}
            <div className="text-center md:text-left space-y-4">
              <div className="flex justify-center md:justify-start">
                <img src="https://via.placeholder.com/100x100" alt="Icon" className="md:max-w-sm" />
              </div>
              <h1 className="text-4xl font-bold">Think, plan, and track all in one place</h1>
              <p className="text-gray-600">Efficiently manage your tasks and boost productivity.</p>
              <Button variant="default" className="px-6 py-3">Get free demo</Button>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-center md:items-end space-y-4">
              <img src="https://via.placeholder.com/150x200" alt="Reminder" className="md:max-w-sm" />
              <img src="https://via.placeholder.com/100x100" alt="Integration" className="md:max-w-xs" />
            </div>
          </div>

          {/* Additional Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Today's tasks</CardTitle>
                <CardDescription>Manage your daily tasks efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>New Ideas for campaign</span>
                    <Badge variant="secondary">60%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Design PPT #4</span>
                    <Badge variant="secondary">112%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardHeader>
                <CardTitle>100+ Integrations</CardTitle>
                <CardDescription>Seamlessly integrate with your favorite tools</CardDescription>
              </CardHeader>
              <CardContent className="flex space-x-4">
                <img src="https://via.placeholder.com/64" alt="Google" className="rounded" />
                <img src="https://via.placeholder.com/64" alt="Slack" className="rounded" />
                <img src="https://via.placeholder.com/64" alt="Calendar" className="rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white p-4 shadow-md text-center">
        <p>&copy; 2023 ChronoTask. All rights reserved.</p>
      </footer>
    </div>
  );
}