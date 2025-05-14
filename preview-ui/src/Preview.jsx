import { Home, User, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from '@/components/ui/pagination';
export default function Preview() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white w-64 p-6 hidden sm:block">
        <div className="flex items-center mb-6">
          <div className="w-6 h-6 mr-2" />
          <span className="text-lg font-semibold">South Park</span>
        </div>
        <nav className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>广告创意与投放</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>广告优化</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">disapprove</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span>广告配置管理</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Content</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>MVP</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Game</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Common Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>SPGA</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>BU2</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>BU3</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Operation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Developer</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Administration</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Staff</span>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="bg-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="filter">创建过滤条件</Label>
            <Input id="filter" placeholder="Filter..." className="ml-2" />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">字段配置</Button>
          </div>
        </header>

        <main className="bg-white rounded shadow p-6 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ad</TableHead>
                <TableHead>站点</TableHead>
                <TableHead>url</TableHead>
                <TableHead>资源类型</TableHead>
                <TableHead>问题资源</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>修改状态</TableHead>
                <TableHead>报错原因</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <TableRow key={item}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>QN</TableCell>
                  <TableCell>or_puppies_168005984.html</TableCell>
                  <TableCell>Portrait image</TableCell>
                  <TableCell>PorLearn Colors with Kids' Quiz</TableCell>
                  <TableCell>不赞成</TableCell>
                  <TableCell>
                    <Badge variant="outline">发布中</Badge>
                  </TableCell>
                  <TableCell>TRADEMARKS_IN_AD</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </main>
      </div>
    </div>
  );
}