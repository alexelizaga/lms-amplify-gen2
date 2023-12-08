import { useRouter } from "next/router";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Badge,
  Button,
} from "@aws-amplify/ui-react";

import { CourseValues } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils";
import { Pencil } from "lucide-react";

interface DataTableProps {
  readonly data: CourseValues[];
}

export function CoursesTable({ data }: DataTableProps) {
  const router = useRouter();

  const goTo = (id: string) => {
    router.push(`/teacher/courses/${id}`);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell as="th">Nº</TableCell>
          <TableCell as="th">Title</TableCell>
          <TableCell as="th">Price</TableCell>
          <TableCell as="th">Published</TableCell>
          <TableCell as="th"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.courseId}>
            <TableCell width={50}>{index + 1}</TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell width={100}>
              {item.price ? formatPrice(item.price) : "No price"}
            </TableCell>
            <TableCell width={100}>
              <Badge
                className={cn("bg-slate-500", item.isPublished && "bg-sky-700")}
              >
                {item.isPublished ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell width={50}>
              <Button
                variation="link"
                size="small"
                loadingText=""
                onClick={() => goTo(item.courseId)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
