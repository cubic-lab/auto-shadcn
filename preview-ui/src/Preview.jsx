import { NavigationMenu, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
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
          <nav className="hidden md:flex space-x-4">
            <NavigationMenu>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="space-y-2">
                    <li><NavigationMenuLink href="#">Feature 1</NavigationMenuLink></li>
                    <li><NavigationMenuLink href="#">Feature 2</NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="space-y-2">
                    <li><NavigationMenuLink href="#">Solution 1</NavigationMenuLink></li>
                    <li><NavigationMenuLink href="#">Solution 2</NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="space-y-2">
                    <li><NavigationMenuLink href="#">Resource 1</NavigationMenuLink></li>
                    <li><NavigationMenuLink href="#">Resource 2</NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="space-y-2">
                    <li><NavigationMenuLink href="#">Pricing Plan 1</NavigationMenuLink></li>
                    <li><NavigationMenuLink href="#">Pricing Plan 2</NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenu>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Sign in</Button>
            <Button variant="default">Get demo</Button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto py-16 text-center">
          <div className="flex justify-center mb-8">
            <img src="https://via.placeholder.com/150" alt="Product Icon" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Think, plan, and track all in one place</h1>
          <p className="text-lg mb-8">Efficiently manage your tasks and boost productivity.</p>
          <Button variant="default" className="mx-auto">Get free demo</Button>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {/* Left Section */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Today's tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">1</Badge>
                    <span>New Ideas for campaign</span>
                  </div>
                  <div className="w-1/2">
                    <div value={60} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">2</Badge>
                    <span>Design PPT #4</span>
                  </div>
                  <div className="w-1/2">
                    <div value={112} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center Section */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p>Today's Meeting</p>
                    <p className="text-sm text-gray-500">Call with marketing team</p>
                  </div>
                  <div>
                    <p>Time</p>
                    <p className="text-sm text-gray-500">13:00 - 13:45</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Section */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>100+ Integrations</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center space-x-4">
              <img src="https://via.placeholder.com/64" alt="Integration 1" className="w-16 h-16" />
              <img src="https://via.placeholder.com/64" alt="Integration 2" className="w-16 h-16" />
              <img src="https://via.placeholder.com/64" alt="Integration 3" className="w-16 h-16" />
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white p-4 shadow-md">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 ChronoTask. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}