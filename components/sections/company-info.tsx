"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function CompanyInfo() {
  const form = useFormContext()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">6. 公司名称</h2>

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>问题14：请提供您的公司名称。</FormLabel>
            <FormControl>
              <Input placeholder="请输入公司名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
