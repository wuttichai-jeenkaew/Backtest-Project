"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteTemplate } from "@/app/templates/actions"

interface DeleteTemplateButtonProps {
  templateId: string
  templateName: string
}

export function DeleteTemplateButton({ templateId, templateName }: DeleteTemplateButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTemplate(templateId)
    setIsDeleting(false)
    
    if (result.success) {
      setShowDialog(false)
      router.refresh()
    }
  }

  return (
    <>
      <DropdownMenuItem
        className="text-red-600"
        onSelect={(e) => {
          e.preventDefault()
          setShowDialog(true)
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        ลบ
      </DropdownMenuItem>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Template</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ Template &quot;{templateName}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบ Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
