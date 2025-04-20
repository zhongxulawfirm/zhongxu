"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Share2, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SuccessViewProps {
  formData: any
  onEdit: () => void
}

export function SuccessView({ formData, onEdit }: SuccessViewProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // 格式化债务项目为可读文本
  const formatDebtItems = () => {
    if (!formData.debtItems || formData.debtItems.length === 0) return "无"

    return formData.debtItems
      .map((item: any, index: number) => {
        // 如果类型或金额为空，则跳过该项
        if (!item.type || !item.amount) return null

        let details = `${item.type || "未指定"}: ${item.amount || "0"}万元, 计息: ${item.hasInterest || "否"}`

        if (item.hasInterest === "是" && item.interestType) {
          details += `, 计息类别: ${item.interestType}`
        }

        if (item.mortgageAssetType) {
          details += `, 抵押物: ${item.mortgageAssetType}`
        }

        if (item.type === "民间借贷" && item.loanSource) {
          details += `, 来源: ${item.loanSource}`
        }

        return `${index + 1}. ${details}`
      })
      .filter(Boolean) // 过滤掉空值
      .join("\n")
  }

  // 格式化资产项目为可读文本
  const formatAssetItems = () => {
    if (!formData.assetItems || formData.assetItems.length === 0) return "无"

    return formData.assetItems
      .map((item: any, index: number) => {
        // 如果类型、数量或金额为空，则跳过该项
        if (!item.type || !item.quantity || !item.amount) return null

        return `${index + 1}. ${item.type || "未指定"}: ${item.quantity || "0"}个, ${item.amount || "0"}万元`
      })
      .filter(Boolean) // 过滤掉空值
      .join("\n")
  }

  // 生成分享图片
  const generateShareImage = async () => {
    if (!tableRef.current) return

    setIsGeneratingImage(true)
    try {
      // 设置背景色为白色，确保图片清晰
      const originalBackground = tableRef.current.style.background
      tableRef.current.style.background = "white"

      const canvas = await html2canvas(tableRef.current, {
        scale: 2, // 提高图片质量
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // 恢复原始背景
      tableRef.current.style.background = originalBackground

      const imageUrl = canvas.toDataURL("image/png")
      setShareImageUrl(imageUrl)
      setIsShareDialogOpen(true)
    } catch (error) {
      console.error("生成图片失败:", error)
      alert("生成分享图片失败，请稍后再试")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // 下载图片
  const downloadImage = () => {
    if (!shareImageUrl) return

    const link = document.createElement("a")
    link.href = shareImageUrl
    link.download = `企业财务状况调研问卷_${formData.companyName || "未命名"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gray-100 border-b">
          <CardTitle className="text-2xl text-center text-gray-800">提交成功</CardTitle>
        </CardHeader>
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center">
          <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">感谢您完成问卷调查！</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            您的信息已成功提交。我们将根据您提供的信息进行分析，并尽快与您联系，为您提供针对性的解决方案。
          </p>
          <div className="flex space-x-4">
            <Button onClick={onEdit} variant="outline">
              返回修改信息
            </Button>
            <Button onClick={generateShareImage} disabled={isGeneratingImage} className="flex items-center">
              <Share2 className="mr-2 h-4 w-4" />
              {isGeneratingImage ? "生成中..." : "分享到微信"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={tableRef}>
        <Card className="w-full shadow-lg">
          <CardHeader className="bg-gray-100 border-b">
            <CardTitle className="text-2xl text-center text-gray-800">问卷信息汇总</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">1. 基本信息</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">您的角色</TableCell>
                      <TableCell>{formData.role || ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">联系方式</TableCell>
                      <TableCell>{formData.contact || ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">所在地区</TableCell>
                      <TableCell>{formData.region || ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">公司名称</TableCell>
                      <TableCell>{formData.companyName || ""}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 债务情况 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. 债务情况</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">债务总额</TableCell>
                      <TableCell>{formData.totalDebt ? `${formData.totalDebt}万元` : ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">主要债务情况</TableCell>
                      <TableCell className="whitespace-pre-line">{formatDebtItems()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">被起诉债务</TableCell>
                      <TableCell>{formData.lawsuitDebts || ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">债务是否进入执行阶段</TableCell>
                      <TableCell>{formData.inExecution || ""}</TableCell>
                    </TableRow>
                    {formData.inExecution === "是" && (
                      <TableRow>
                        <TableCell className="font-medium">查封、拍卖情况</TableCell>
                        <TableCell>{formData.executionDetails || ""}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium">债务性质</TableCell>
                      <TableCell>{formData.personalDebt || ""}</TableCell>
                    </TableRow>
                    {formData.personalDebt === "有连带个人债务" && (
                      <TableRow>
                        <TableCell className="font-medium">连带个人债务金额</TableCell>
                        <TableCell>{formData.personalDebtAmount ? `${formData.personalDebtAmount}万元` : ""}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 资产情况 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3. 资产情况</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">资产总额</TableCell>
                      <TableCell>{formData.totalAsset ? `${formData.totalAsset}万元` : ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">主要资产情况</TableCell>
                      <TableCell className="whitespace-pre-line">{formatAssetItems()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 客户诉求 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4. 客户诉求</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">是否继续经营企业</TableCell>
                      <TableCell>{formData.continueBusiness || ""}</TableCell>
                    </TableRow>
                    {formData.continueBusiness === "是" && (
                      <TableRow>
                        <TableCell className="font-medium">想要解决的问题</TableCell>
                        <TableCell>{formData.problemsToSolve || ""}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 清算与实缴情况 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">5. 清算与实缴情况</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">注册资本是否已完成实缴</TableCell>
                      <TableCell>{formData.capitalPaid || ""}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">注册资本</TableCell>
                      <TableCell>{formData.registeredCapital ? `${formData.registeredCapital}万元` : ""}</TableCell>
                    </TableRow>
                    {formData.capitalPaid === "已完成实缴（包括部分完成）" && (
                      <TableRow>
                        <TableCell className="font-medium">实缴金额</TableCell>
                        <TableCell>{formData.paidCapital ? `${formData.paidCapital}万元` : ""}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium">注册时间</TableCell>
                      <TableCell>{formData.registrationDate || ""}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 支付能力 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6. 支付能力</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">企业是否还在经营</TableCell>
                      <TableCell>{formData.stillOperating || ""}</TableCell>
                    </TableRow>
                    {formData.stillOperating === "是" && (
                      <TableRow>
                        <TableCell className="font-medium">员工数量</TableCell>
                        <TableCell>{formData.employeeCount || ""}</TableCell>
                      </TableRow>
                    )}
                    {formData.stillOperating === "否" && (
                      <TableRow>
                        <TableCell className="font-medium">停止经营时间</TableCell>
                        <TableCell>{formData.stopOperatingTime || ""}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium">是否有其他业务在经营</TableCell>
                      <TableCell>{formData.otherBusiness || ""}</TableCell>
                    </TableRow>
                    {formData.otherBusiness === "是" && (
                      <TableRow>
                        <TableCell className="font-medium">其他业务内容</TableCell>
                        <TableCell>{formData.otherBusinessContent || ""}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分享弹窗 */}
      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>分享到微信</AlertDialogTitle>
            <AlertDialogDescription>
              图片已生成，请点击下方按钮下载图片，然后打开微信分享给好友或朋友圈。
            </AlertDialogDescription>
          </AlertDialogHeader>

          {shareImageUrl && (
            <div className="flex justify-center my-4">
              <img
                src={shareImageUrl || "/placeholder.svg"}
                alt="问卷信息汇总"
                className="max-h-[300px] border border-gray-200 rounded shadow-sm"
              />
            </div>
          )}

          <AlertDialogFooter>
            <Button onClick={downloadImage} className="w-full flex items-center justify-center">
              <Download className="mr-2 h-4 w-4" /> 下载图片
            </Button>
            <AlertDialogAction className="mt-2">关闭</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
