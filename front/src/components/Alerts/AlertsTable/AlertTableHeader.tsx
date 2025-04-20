import React, { memo } from "react"
import { TableCell, TableRow, TableHeader } from "../../Table"

const AlertTableHeader: React.FC = () => {
    return (
        <TableHeader isSticky={true}>
            <TableRow>
              <TableCell type="header">Name</TableCell>
              <TableCell type="header">Location</TableCell>
              <TableCell type="header">Parameter</TableCell>
              <TableCell type="header">Operator</TableCell>
              <TableCell type="header">Value</TableCell>
              <TableCell type="header">Status</TableCell>
              <TableCell type="header">Created</TableCell>
              <TableCell type="header">Updated</TableCell>
            </TableRow>
          </TableHeader>
    )
}
AlertTableHeader.displayName = 'AlertTableHeader';
export default memo(AlertTableHeader);