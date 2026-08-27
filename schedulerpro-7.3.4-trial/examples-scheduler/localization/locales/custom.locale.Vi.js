import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Vi.js';

const locale = {

    localeName : 'Vi',
    localeDesc : 'Tiếng Việt',
    localeCode : 'vi',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Trình diễn bản địa hóa'
    },

    Button : {
        'Add column'    : 'Thêm cột',
        'Display hints' : 'Hiển thị gợi ý',
        'Remove column' : 'Xóa cột',
        Apply           : 'Áp dụng',
        Learn           : 'Học',
        DownloadTrial   : 'Tải bản dùng thử',
        upgradeGuide    : 'Hướng dẫn nâng cấp',
        documentation   : 'Tài liệu',
        tabJS           : 'Hiển thị ví dụ JavaScript',
        tabReact        : 'Hiển thị ví dụ React',
        tabVue          : 'Hiển thị ví dụ Vue',
        tabAngular      : 'Hiển thị ví dụ Angular'
    },

    Column : {
        Company : 'Công ty',
        Name    : 'Tên'
    },

    Checkbox : {
        'Auto apply'  : 'Tự động áp dụng',
        Automatically : 'Tự động',
        runHints      : 'Chạy luồng gợi ý khi khởi động'
    },

    CodeEditor : {
        'Code editor'   : 'Trình chỉnh sửa mã',
        'Download code' : 'Tải xuống mã'
    },

    Combo : {
        Theme    : 'Chủ đề',
        Language : 'Ngôn ngữ',
        Size     : 'Kích thước',
        jumpTo   : 'Chuyển đến'
    },

    Shared : {
        'Full size'      : 'Kích thước đầy đủ',
        'Locale changed' : 'Ngôn ngữ đã thay đổi',
        'Phone size'     : 'Kích thước điện thoại',
        primaryColor     : 'Màu chính'
    },

    Tooltip : {
        infoButton       : 'Nhấn để hiển thị thông tin và chuyển đổi chủ đề hoặc ngôn ngữ',
        codeButton       : 'Nhấn để hiển thị trình chỉnh sửa mã tích hợp',
        hintCheck        : 'Chọn để tự động hiển thị gợi ý khi tải ví dụ',
        fullscreenButton : 'Toàn màn hình',
        openInCodePen    : 'Mở trong CodePen',
        toggleLightDark  : 'Chuyển đổi chế độ sáng / tối'
    },

    Popup : {
        UsedClasses : 'Các lớp được sử dụng trong bản demo này'
    },

    TextField : {
        Filter : 'Bộ lọc'
    },

    FilterField : {
        typeToFilter : 'Nhập để lọc'
    },

    SlideToggle : {
        newDemos : 'Mới và cập nhật'
    }
};

export default LocaleHelper.publishLocale(locale);
