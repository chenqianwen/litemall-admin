<template>
  <div class="app-container calendar-list-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input clearable class="filter-item" style="width: 200px;" placeholder="请输入广告标题" v-model="listQuery.name">
      </el-input>
      <el-input clearable class="filter-item" style="width: 200px;" placeholder="请输入广告内容" v-model="listQuery.content">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-download" @click="handleDownload"
                 :loading="downloadLoading">导出
      </el-button>
    </div>

    <!-- 查询结果 -->
    <el-table size="small" :data="list" v-loading="listLoading" element-loading-text="正在查询中。。。" border fit
              highlight-current-row>


      <el-table-column align="center" width="100px" label="诊所ID" prop="id" sortable>
      </el-table-column>

      <el-table-column align="center" label="诊所名称" prop="name">
      </el-table-column>

      <el-table-column align="center" label="排序" prop="sort">
      </el-table-column>

      <el-table-column align="center" width="200px" height="200px" label="诊所图片">
        <template slot-scope="scope">
          <img style="width:100%;" :src="scope.row.imgUrl"></img>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="listQuery.page"
                     :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-dialog
        width="50%"
        title="放大图"
        :visible.sync="dialogVisible"
        append-to-body>
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
      <el-form :rules="rules" ref="dataForm" :model="dataForm" status-icon label-position="left" label-width="100px"
               style='width: 600px; margin-left:50px;'>
        <el-form-item label="诊所名称" prop="name">
          <el-input v-model="dataForm.name"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="dataForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="诊所图片" prop="imgUrl">
          <el-upload
            action="#"
            :limit="1"
            list-type="picture-card"
            :on-exceed="handleExceed"
            :http-request="uploadUrl"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :file-list="fileList">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style>
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 200px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
</style>

<script>
  import {createHospital, listHospital, updateHospital} from '@/api/hospital'
  import {createStorage, uploadFile, deleteFile} from '@/api/storage'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'Hospital',
    directives: {
      waves
    },
    data() {
      return {
        fileList: [],
        list: undefined,
        total: undefined,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          name: undefined,
          content: undefined,
          sort: 'id'
        },
        dataForm: {
          id: undefined,
          name: undefined,
          sort: undefined,
          imgUrl: undefined
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          name: [{required: true, message: '名称不能为空', trigger: 'blur'}],
          sort: [{required: true, message: '排序不能为空', trigger: 'blur'}],
          imgUrl: [{required: true, message: '图片不能为空', trigger: 'blur'}]
        },
        downloadLoading: false,
        dialogImageUrl: '',
        dialogVisible: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      formatPosition(row, column, cellValue, index) {
        if (cellValue === 0) {
          return '开始'
        } else if (cellValue === 1) {
          return '首页'
        }
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前最多选择 1 个文件`);
      },
      handleRemove(file, fileList) {
        let url = file.url
        deleteFile(url, (res) => {
          this.dataForm.imgUrl = ''
          this.$notify({
            title: '成功',
            message: '删除',
            type: 'success',
            duration: 2000
          })
        })
        console.log(JSON.stringify(file));
        console.log(JSON.stringify(fileList));
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      getList() {
        this.listLoading = true
        listHospital(this.listQuery).then(response => {
          this.list = response.data.data.items
          this.total = response.data.data.total
          this.listLoading = false
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      resetForm() {
        this.dataForm = {
          id: undefined,
          name: undefined,
          sort: undefined,
          imgUrl: undefined
        }
        this.fileList = []
      },
      handleCreate() {
        this.resetForm()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      uploadUrl(item) {
        const formData = new FormData()
        formData.append('file', item.file)
        uploadFile(formData, (res) => {
          console.log(res)
          this.dataForm.imgUrl = res
          this.$notify({
            title: '成功',
            message: '上传',
            type: 'success',
            duration: 2000
          })
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createHospital(this.dataForm).then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.dataForm = Object.assign({}, row)
        this.fileList = [{url: row.imgUrl}]
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            updateHospital(this.dataForm).then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDelete(row) {
        deleteAd(row).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
      },
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['广告ID', '广告标题', '广告内容', '广告图片', '广告位置', '活动链接', '是否启用']
          const filterVal = ['id', 'name', 'content', 'url', 'postion', 'link', 'enabled']
          excel.export_json_to_excel2(tHeader, this.list, filterVal, '广告信息')
          this.downloadLoading = false
        })
      }
    }
  }
</script>
