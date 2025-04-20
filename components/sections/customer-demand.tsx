"use client"

import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CustomRadio } from "@/components/ui/custom-radio"

export function CustomerDemand() {
  const form = useFormContext()

  const continueOptions = [
    { value: "是", label: "是" },
    { value: "否", label: "否" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">4. 客户诉求</h2>

      <FormField
        control={form.control}
        name="continueBusiness"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>问题10：您目前是否还想继续经营企业？</FormLabel>
            <FormControl>
              <CustomRadio
                options={continueOptions}
                name="continueBusiness"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("continueBusiness") === "是" && (
        <FormField
          control={form.control}
          name="problemsToSolve"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题11：请说明您主要想要解决的问题是什么？</FormLabel>
              <FormControl>
                <Textarea placeholder="请详细描述您想要解决的问题" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
