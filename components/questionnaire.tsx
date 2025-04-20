"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BasicInfo } from "./sections/basic-info"
import { DebtInfo } from "./sections/debt-info"
import { AssetInfo } from "./sections/asset-info"
import { CustomerDemand } from "./sections/customer-demand"
import { LiquidationInfo } from "./sections/liquidation-info"
import { CompanyInfo } from "./sections/company-info"
import { PaymentAbility } from "./sections/payment-ability"
import { SuccessView } from "./success-view"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"

// 定义表单验证模式
const formSchema = z.object({
  // 基本信息
  role: z.string().min(1, { message: "请选择您的角色" }),
  contact: z.string().min(1, { message: "请提供联系方式" }),
  region: z.string().min(1, { message: "请选择所在地区" }),

  // 债务情况
  totalDebt: z.string().min(1, { message: "请填写债务总额" }),
  debtItems: z
    .array(
      z.object({
        type: z.string(),
        amount: z.string(),
        hasInterest: z.string(),
        mortgageAssetType: z.string().optional(),
        loanSource: z.string().optional(),
      }),
    )
    .optional(),
  lawsuitDebts: z.string().optional(),
  inExecution: z.string(),
  executionDetails: z.string().optional(),
  personalDebt: z.string(),
  personalDebtAmount: z.string().optional(),

  // 资产情况
  totalAsset: z.string().min(1, { message: "请填写资产总额" }),
  assetItems: z
    .array(
      z.object({
        type: z.string(),
        quantity: z.string(),
        amount: z.string(),
      }),
    )
    .optional(),

  // 客户诉求
  continueBusiness: z.string(),
  problemsToSolve: z.string().optional(),

  // 清算与实缴情况
  capitalPaid: z.string(),
  registeredCapital: z.string().optional(),
  paidCapital: z.string().optional(),
  registrationDate: z.string().optional(),

  // 公司名称
  companyName: z.string().min(1, { message: "请提供公司名称" }),

  // 支付能力
  stillOperating: z.string(),
  employeeCount: z.string().optional(),
  stopOperatingTime: z.string().optional(),
  otherBusiness: z.string(),
})

type FormValues = z.infer<typeof formSchema>

// 定义表单部分
const sections = [
  { title: "基本信息", component: BasicInfo },
  { title: "债务情况", component: DebtInfo },
  { title: "资产情况", component: AssetInfo },
  { title: "客户诉求", component: CustomerDemand },
  { title: "清算与实缴情况", component: LiquidationInfo },
  { title: "公司名称", component: CompanyInfo },
  { title: "支付能力", component: PaymentAbility },
]

export function Questionnaire() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null)

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      contact: "",
      region: "",
      totalDebt: "",
      debtItems: [{ type: "", amount: "", hasInterest: "否" }],
      lawsuitDebts: "",
      inExecution: "否",
      executionDetails: "",
      personalDebt: "全部为企业债务",
      personalDebtAmount: "",
      totalAsset: "",
      assetItems: [{ type: "", quantity: "", amount: "" }],
      continueBusiness: "是",
      problemsToSolve: "",
      capitalPaid: "未完成实缴",
      registeredCapital: "",
      paidCapital: "",
      registrationDate: "",
      companyName: "",
      stillOperating: "是",
      employeeCount: "",
      stopOperatingTime: "",
      otherBusiness: "否",
    },
    mode: "onBlur",
  })

  const CurrentSectionComponent = sections[currentSection].component

  function onSubmit(data: FormValues) {
    console.log(data)
    setSubmittedData(data)
    setIsSubmitted(true)
  }

  function handleEdit() {
    setIsSubmitted(false)
    // 返回到第一部分
    setCurrentSection(0)
    window.scrollTo(0, 0)
  }

  function nextSection() {
    // 尝试验证当前部分的字段
    methods.trigger().then((isValid) => {
      if (isValid && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1)
        window.scrollTo(0, 0)
      }
    })
  }

  function prevSection() {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.scrollTo(0, 0)
    }
  }

  const progress = ((currentSection + 1) / sections.length) * 100

  if (isSubmitted && submittedData) {
    return <SuccessView formData={submittedData} onEdit={handleEdit} />
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gray-100 border-b">
        <CardTitle className="text-2xl text-center text-gray-800">企业财务状况调研问卷</CardTitle>
        <CardDescription className="text-center text-gray-600 mt-2">
          尊敬的受访者，为了更好地了解您的企业财务状况，并为您提供针对性的解决方案，我们特此开展本次调研。
          请您根据企业实际情况，如实填写以下问卷。您的信息将仅用于本次调研分析，我们承诺严格保密。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              第 {currentSection + 1} 部分，共 {sections.length} 部分
            </span>
            <span>{sections[currentSection].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CurrentSectionComponent />

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> 上一步
              </Button>

              {currentSection < sections.length - 1 ? (
                <Button type="button" onClick={nextSection} className="flex items-center">
                  下一步 <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit">提交问卷</Button>
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  )
}
