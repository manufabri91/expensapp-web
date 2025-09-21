import { Card, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Skeleton } from '@heroui/skeleton';

export default function Loading() {
  return (
    <div>
      <div className="flex w-full flex-col justify-center gap-4 md:flex md:flex-row md:flex-wrap">
        <Card className="space-y-5 p-4 md:min-w-[300px]">
          <CardBody>
            <div className="space-y-3">
              <Skeleton className="w-2/5 rounded-lg">
                <div className="bg-default-200 h-3 w-4/5 rounded-lg" />
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="bg-default-200 h-6 w-3/5 self-center rounded-lg" />
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="bg-default-300 h-3 w-2/5 rounded-lg" />
              </Skeleton>
            </div>
            <Divider className="my-7" />
            <div className="space-y-6">
              <Skeleton className="w-4/5 rounded-lg">
                <div className="bg-default-200 h-2 w-2/5 rounded-lg" />
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="bg-default-200 h-2 w-1/5 rounded-lg" />
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
